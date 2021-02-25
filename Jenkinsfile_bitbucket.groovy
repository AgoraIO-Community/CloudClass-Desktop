// -*- mode: groovy -*-
// vim: set filetype=groovy :
import groovy.transform.Field
import hudson.model.Result
import jenkins.model.CauseOfInterruption
import org.jenkinsci.plugins.workflow.steps.FlowInterruptedException
@Library('agora-build-pipeline-library') _

@Field def release_branch_pattern = ~/^release\/(\d+.\d+.\d+(.\d)?)_[a-z]+$|arsenal/
@Field def repo_name = "cloudclass-desktop"
@Field def repo_branch = ""


withWechatNotify {
    withKnownErrorHandling {
        timestamps {
            repo_branch = env.CHANGE_BRANCH ?: env.BRANCH_NAME
            abortPreviousRunningBuilds()

            def build_params = [
                string(name: 'build_branch', value: repo_branch),
                string(name: 'ci_branch', value: 'master'),
                string(name: 'build_env', value: 'test'),
                booleanParam(name: 'Package_Publish', value: false),
            ]
            parallel( MacBuild: {
                stage('Compile on Mac') {
                    build job: 'AD/Agora-CloudClass-Mac', parameters: build_params, wait: true
                }
            },
            WindowsBuild: {
                stage('Compile on Windows') {
                    build job: 'AD/Agora-CloudClass-Windows', parameters: build_params + [
                        booleanParam(name: 'lerna_clean', value: false),
                    ], wait: true
                }
            }, failFast: true)
        }
    }
}

def withKnownErrorHandling(Closure block) {
    def utils = new agora.build.Utils()
    try {
        block()
        currentBuild.result = "SUCCESS"
    } catch (Exception ex) {
        currentBuild.result = "FAILURE"
        throw ex
    }
}

def currentCommitHash() {
    return commitHashForBuild( currentJenkinsBuild() )
}

@NonCPS
def currentJenkinsBuild() {
    def job = Jenkins.instance.getItemByFullName( env.JOB_NAME )
    return job.getBuild( env.BUILD_ID )
}

@NonCPS
def commitHashForBuild( build ) {
    def scmAction = build?.actions.find { action -> action instanceof jenkins.scm.api.SCMRevisionAction }
    return scmAction?.revision?.hasProperty('hash') ? scmAction?.revision?.hash : scmAction?.revision
}

def abortPreviousRunningBuilds() {
    Hudson.instance.getItemByFullName(env.JOB_NAME)?.getBuilds().each{ build ->
        def exec = build.getExecutor()
        if (build.number != currentBuild.number && exec != null ) {
            exec.interrupt(
                 Result.ABORTED,
                 new CauseOfInterruption.UserInterruption( "Aborted by #${currentBuild.number}" )
            )
            println("Aborted previous running build #${build.number}")
        }
    }
}

def withWechatNotify(Closure block) {
    try {
        block()
    } catch (FlowInterruptedException fie) {
        echo "Info: Cancelled by afterwards build, ignore warning."
    } catch (Exception ex) {
        if (repo_branch ==~ release_branch_pattern ) {
            head = '<font color=\\"red\\">Main Branch failed </font>. Please deal with them as soon as possible.\\n'
            branch = ">**${env.BRANCH_NAME}**" + '\\n'
            url = ">[${env.RUN_DISPLAY_URL}](${env.RUN_DISPLAY_URL})" + '\\n'
            exeception = ">Info: ${ex.toString()}"
            content = "${head}${branch}${url}${exeception}"
            def payload = """
                {
                    "msgtype": "markdown",
                    "markdown": {
                        "content": \"${content}\"
                    }
                }
                """
            httpRequest httpMode: 'POST',
                    acceptType: 'APPLICATION_JSON_UTF8',
                    contentType: 'APPLICATION_JSON_UTF8',
                    ignoreSslErrors: true, responseHandle: 'STRING',
                    requestBody: payload,
                    url: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=6742e321-b00b-4efb-9c76-456a5b59e867"
        }
        throw ex
    }
}

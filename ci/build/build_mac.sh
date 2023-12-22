source_root=$(pwd)
ci_source_root=../apaas-cicd-web
build_branch=$cloudclass_desktop_branch

ci_script_version=v1

. ../apaas-cicd-web/versions.sh
. ../apaas-cicd-web/utilities/tools.sh
. ../apaas-cicd-web/build/$ci_script_version/dependency.sh
. ../apaas-cicd-web/build/$ci_script_version/build.sh

# pick up agora-rte-sdk agora-edu-core agora-common-libs
lib_dependencies=(${lib_dependencies[@]:0:3})
lib_versions=(${lib_versions[@]:0:3})
lib_branches=(${lib_branches[@]:0:3})

if [ "$debug" == "true" ]; then
    # show environment variables
    echo "------------- variables --------------------"
    set
    echo "--------------------------------------------"
fi

download_packages $source_root $build_branch "${lib_dependencies[*]}" "${lib_versions[*]}" "${lib_branches[*]}"

make_monorepo $source_root

install_packages $source_root

build_lib $source_root $ci_source_root agora-classroom-sdk $build_branch

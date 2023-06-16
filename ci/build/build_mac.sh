source_root=$(pwd)
ci_source_root=../apaas-cicd-web
build_branch=$cloudclass_desktop_branch

ci_script_version=v1
lib_dependencies=(
    agora-rte-sdk
    agora-edu-core
    agora-common-libs
)

. ../apaas-cicd-web/utilities/tools.sh
. ../apaas-cicd-web/build/$ci_script_version/dependency.sh
. ../apaas-cicd-web/build/$ci_script_version/build.sh

if [ "$debug" == "true" ]; then
    # show environment variables
    echo "------------- variables --------------------"
    set
    echo "--------------------------------------------"
fi

check_dependencies $source_root $build_branch "${lib_dependencies[*]}"

build_lib $source_root $ci_source_root agora-classroom-sdk $build_branch

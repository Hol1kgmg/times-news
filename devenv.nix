{ pkgs, lib, ... }:

let
  # gh 拡張機能
  ghExtensions = [
    pkgs.gh-stack
  ];

  linkGhExtension = pkg: ''
    ext_dir="$XDG_DATA_HOME/gh/extensions/${pkg.pname}"
    ext_target="${pkg}/bin"
    if [ ! -e "$ext_dir" ] || [ "$(readlink "$ext_dir")" != "$ext_target" ]; then
      mkdir -p "$(dirname "$ext_dir")"
      ln -sfn "$ext_target" "$ext_dir"
    fi
  '';
in
{
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    corepack.enable = true;
  };

  packages = [
    pkgs.gitleaks
    pkgs.actionlint
    pkgs.ghalint
    pkgs.pinact
    pkgs.just
    pkgs.gh
    pkgs.jq
    pkgs.bc
  ] ++ ghExtensions;

  # gh の拡張機能ディレクトリをプロジェクトローカルに隔離する（$HOME を書き換えない）
  enterShell = ''
    export XDG_DATA_HOME="$DEVENV_STATE/xdg-data"
    mkdir -p "$XDG_DATA_HOME/gh/extensions"
  '' + lib.concatMapStringsSep "\n" linkGhExtension ghExtensions;
}

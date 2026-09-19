{
  inputs = {
    nixpkgs.url = "github:cachix/devenv-nixpkgs/rolling";
    flake-utils.url = "github:numtide/flake-utils";
    nur-packages.url = "github:Hol1kgmg/nur-packages";
  };

  outputs = { self, nixpkgs, flake-utils, nur-packages, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        lib = pkgs.lib;

        # CI の setup-node にも同じバージョンを渡すため、ここを唯一の定義箇所にする
        nodejs = pkgs.nodejs_24;

        # nixpkgs未収載のためローカルでビルドする
        gh-pr-graph = pkgs.buildGoModule {
          pname = "gh-pr-graph";
          version = "0.14.5";
          src = pkgs.fetchFromGitHub {
            owner = "orangain";
            repo = "gh-pr-graph";
            rev = "v0.14.5";
            hash = "sha256-kSbtyDA52fYvcT0hd6SZ/1E6lA6j+wbsXEGzLhUy5gg=";
          };
          vendorHash = null;
        };

        # gh 拡張機能
        ghExtensions = [
          pkgs.gh-stack
          gh-pr-graph
        ];

        linkGhExtension = pkg: ''
          ext_dir="$XDG_DATA_HOME/gh/extensions/${pkg.pname}"
          ext_target="${pkg}/bin"
          if [ ! -e "$ext_dir" ] || [ "$(readlink "$ext_dir")" != "$ext_target" ]; then
            mkdir -p "$(dirname "$ext_dir")"
            ln -sfn "$ext_target" "$ext_dir"
          fi
        '';
      in {
        # GitHub Actions が `nix eval --raw .#node.version` で参照する。
        # flake.lock の nixpkgs 更新に CI の Node.js バージョンを自動追従させるため。
        packages.node = nodejs;

        devShells.default = pkgs.mkShell {
          packages = [
            nodejs
            pkgs.gitleaks
            pkgs.actionlint
            pkgs.ghalint
            pkgs.pinact
            pkgs.just
            pkgs.gh
            pkgs.jq
            pkgs.bc
            nur-packages.packages.${system}.spec-kit
          ] ++ ghExtensions;

          shellHook = ''
            state_dir="$PWD/.direnv/state"
            mkdir -p "$state_dir"

            # corepack (pnpm/yarn) の shim をプロジェクトローカルに隔離する
            corepack_dir="$state_dir/corepack-bin"
            mkdir -p "$corepack_dir"
            corepack enable --install-directory "$corepack_dir"
            export PATH="$corepack_dir:$PATH"

            # gh の拡張機能ディレクトリをプロジェクトローカルに隔離する（$HOME を書き換えない）
            export XDG_DATA_HOME="$state_dir/xdg-data"
            mkdir -p "$XDG_DATA_HOME/gh/extensions"
          '' + lib.concatMapStringsSep "\n" linkGhExtension ghExtensions;
        };
      });
}

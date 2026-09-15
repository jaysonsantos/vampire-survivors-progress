{
  description = "Vampire Survivors progress: an offline single-page app that reads a save file";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs }:
    let
      forAllSystems = nixpkgs.lib.genAttrs [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              # Frontend: the SvelteKit app and the catalog generator.
              nodejs_24
              pnpm

              # Linters and hooks.
              prek
              biome
              typos
              shellcheck
              nixfmt-rfc-style

              # Repository work.
              git
              gh
              jq
            ];
          };
        }
      );

      formatter = forAllSystems (system: nixpkgs.legacyPackages.${system}.nixfmt-rfc-style);
    };
}

"""Typer CLI entrypoint: `mi-state refresh <dataset>` or `mi-state refresh all`."""
import logging
import sys

import typer

from .fetchers import (
    acs_uninsured,
    egle_pfas,
    mde_absenteeism,
    mdhhs_respiratory,
    mshda_housing,
    socrata,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

app = typer.Typer(no_args_is_help=True, add_completion=False)

FETCHERS = {
    "egle_pfas_sites":     egle_pfas.refresh,
    "acs_uninsured":       acs_uninsured.refresh,
    "mshda_cost_burden":   mshda_housing.refresh,
    "mdhhs_respiratory":   mdhhs_respiratory.refresh,
    "mde_absenteeism":     mde_absenteeism.refresh,
    "socrata_generic":     socrata.refresh_cli,
}


@app.command()
def refresh(dataset: str) -> None:
    """Refresh one dataset by id, or 'all' to run every registered fetcher."""
    if dataset == "all":
        failed: list[str] = []
        for name, fn in FETCHERS.items():
            try:
                fn()
                typer.echo(f"ok   {name}")
            except NotImplementedError as e:
                typer.echo(f"skip {name}  (stub: {e})")
            except Exception as e:
                typer.echo(f"ERR  {name}: {e}")
                failed.append(name)
        if failed:
            sys.exit(1)
        return

    fn = FETCHERS.get(dataset)
    if fn is None:
        typer.echo(f"unknown dataset '{dataset}'. Known: {', '.join(FETCHERS)}")
        sys.exit(2)
    fn()
    typer.echo(f"ok {dataset}")


@app.command()
def datasets() -> None:
    """List every dataset id registered in the CLI."""
    for name in FETCHERS:
        typer.echo(name)


if __name__ == "__main__":
    app()

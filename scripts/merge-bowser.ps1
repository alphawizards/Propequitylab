$src = 'C:\Temp\bowser\.claude'
$dst = 'C:\Users\ckr_4\01 Projects\Propequitylab\.claude'

$items = @(
    'agents\bowser-qa-agent.md',
    'agents\claude-bowser-agent.md',
    'agents\playwright-bowser-agent.md',
    'commands\build.md',
    'commands\list-tools.md',
    'commands\prime.md',
    'commands\ui-review.md',
    'commands\bowser\amazon-add-to-cart.md',
    'commands\bowser\blog-summarizer.md',
    'commands\bowser\hop-automate.md',
    'skills\claude-bowser\SKILL.md',
    'skills\just\SKILL.md',
    'skills\just\examples\bun-typescript.just',
    'skills\just\examples\multi-module.just',
    'skills\just\examples\node-docker.just',
    'skills\just\examples\python-venv.just',
    'skills\just\examples\uv-python.just',
    'skills\playwright-bowser\SKILL.md',
    'skills\playwright-bowser\docs\playwright-cli.md'
)

foreach ($item in $items) {
    $srcFile = Join-Path $src $item
    $dstFile = Join-Path $dst $item
    $dstDir = Split-Path $dstFile
    if (-not (Test-Path $dstDir)) {
        New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
    }
    if (Test-Path $dstFile) {
        Write-Host "SKIP (exists): $item"
    } else {
        Copy-Item $srcFile $dstFile
        Write-Host "COPIED: $item"
    }
}
Write-Host "Done."

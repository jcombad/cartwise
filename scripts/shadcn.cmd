@echo off

if not exist package.json (
    echo Error: Execute este script na raiz do projeto.
    exit /b 1
)

set HOME=%APPDATA%
call npx shadcn %*
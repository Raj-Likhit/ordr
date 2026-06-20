Get-ChildItem -Path "c:\Users\rajli\Downloads\Ordr\ordr\app" -Recurse -Filter "*.tsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "// placeholder") {
        $name = $_.BaseName
        $newContent = "export default function Placeholder() { return <div>$name</div>; }"
        Set-Content -Path $_.FullName -Value $newContent
    }
}

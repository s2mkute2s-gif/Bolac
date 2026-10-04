from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[1]
ts=list((root/'src').rglob('*.ts'))
text='\n'.join(p.read_text(errors="ignore") for p in ts)
report={"typescript_files":len(ts),"source_js_files":len(list((root/'src').rglob('*.js'))),"explicit_any_tokens":len(re.findall(r"\bany\b",text)),"ts_suppressions":len(re.findall(r"@ts-(?:no|ignore|expect)",text)),"mjs_tool_test_files":len(list((root/'tests').rglob('*.mjs')))+len(list((root/'port-tools').rglob('*.mjs')))}
print(json.dumps(report,indent=2))

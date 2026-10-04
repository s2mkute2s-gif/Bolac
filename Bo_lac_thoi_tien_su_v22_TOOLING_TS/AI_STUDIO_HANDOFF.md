# AI Studio handoff — Bộ lạc thời tiền sử

## Mục tiêu
Đây là source web TypeScript đã reverse từ runtime Java ME. Không cần reverse lại JAR. Hãy bảo toàn behavior hiện tại trước khi refactor.

## Chạy dự án
```bash
npm install
npm run check
npm start
```
Mở http://localhost:8080.

## Build
```bash
npm run build
npm run build:tools
```
Output web: `dist/`. Tool/test output: `.tool-dist/`.

## Baseline bắt buộc
Trước và sau mọi thay đổi, chạy `npm run check`. Regression hiện có 15 test và baseline phải giữ 15/15 PASS.

## Runtime strict migration
Lệnh audit riêng:
```bash
npm run typecheck:strict-runtime
```
Không được làm compiler xanh bằng `@ts-ignore`, `@ts-nocheck`, `any`, hoặc mass non-null assertion (`!`).
Ưu tiên type contracts/shared helpers trong `src/runtime-types.ts` và `src/runtime-values.ts`, sau đó sửa theo thứ tự:
1. `vm.ts` — JVM frame/thread/class/method/field/reference contracts.
2. `midp.ts` — MIDP/native bridge, Canvas/Image/media/storage.
3. `touch.ts`, `art.ts`, `shell.ts`.
4. `unicode-text.ts`, `hud-icons.ts`.

Runtime là bytecode interpreter: không thay đổi opcode arithmetic/stack order/exception semantics chỉ để thỏa TypeScript.

## File quan trọng
- `src/vm.ts`: Java bytecode VM.
- `src/midp.ts`: MIDP/native bridge.
- `src/runtime-types.ts`: shared runtime contracts.
- `src/runtime-values.ts`: safe value conversion helpers.
- `src/classes.json`, `src/resources.json`, `src/resources/`: game data/assets.
- `tests/`: regression tests.
- `port-tools/`: reverse/audit tooling.

## Nguyên tắc cho AI Studio
Không dựng game mới từ đầu. Tiếp tục trực tiếp source này, giữ assets/game data và runtime behavior. Mỗi refactor phải được kiểm tra bằng regression trước khi chuyển sang module tiếp theo.

## LITE package
This LITE archive removes generated dist/.tool-dist and port-tools visual probe screenshots only. Game runtime assets under src/ are preserved. Run npm install && npm run check to rebuild and verify.

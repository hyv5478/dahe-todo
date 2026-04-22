# Design System: 大何的待办事项

## 1. Visual Theme & Atmosphere
Quiet, work-focused, and durable. The interface should feel like a local personal operations desk: calm enough for repeated daily use, dense enough for many small tasks, and clear enough to find older work quickly.

## 2. Color Palette & Roles
- Ink Black (`#17212b`): primary text and active navigation.
- Workbench Gray (`#eef1f4`): page background, separating the app from browser chrome.
- Paper White (`#ffffff`): main surfaces, forms, task cards, and editable content.
- Soft Field Gray (`#f6f8fa`): secondary surfaces such as completed-comment areas.
- Ledger Green (`#22784f`): primary action, completion state, and focus accent.
- Archive Blue (`#286ba8`): low-priority state.
- Attention Amber (`#a36318`): urgent state.
- Destructive Red (`#b33131`): delete and irreversible actions.

## 3. Typography Rules
Use the local system Chinese UI stack: Microsoft YaHei, Segoe UI, Arial, sans-serif. Headings are strong and compact; body text uses relaxed line-height for Chinese readability. Numbers use tabular figures where counts or dates need visual stability.

## 4. Component Stylings
- **Buttons:** 8px radius, minimum 44px height, one primary green action per form area. Secondary buttons stay white with gray borders.
- **Cards/Containers:** 8px radius with restrained borders. Shadows are used only on the two major surfaces, not on every repeated item.
- **Inputs/Forms:** Visible labels, white input background, green focus ring. Textareas remain resizable for long comments.
- **Task Items:** Dense list cards with clear completion affordance, priority badge, metadata row, and expandable comment area.

## 5. Layout Principles
Desktop uses a single-page task desk: identity, date, counts, and capture sit at the top; search, navigation, lists, history filters, and reports sit below in one scanning flow. Mobile remains one column. The design prioritizes fast capture, retrieval, and repeated input over decorative presentation.

# Sidebar UI Polish + Custom Delete Modal

- Removed disk controls footer bar — refresh + disconnect now in header only
- Custom delete confirmation modal replaces native `confirm()` that was flashing/auto-dismissing
- Modal has backdrop blur overlay, red Delete button, Cancel to dismiss, click-outside to close
- Updated tests: footer assertions → header button assertions (102 tests passing)

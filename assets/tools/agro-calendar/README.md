# Agro Calendar Visualization

Live tool: <https://movephutthaphaiboon.github.io/tools/agro-calendar/>

Turns a monthly catch (or harvest) table into a seasonal calendar. Each species is only drawn in the
months when it is caught, and the colour shows the **monthly catch** (pale = low, strong = high).
Choose the layout with the *Layout* switch above the chart:

- **Horizontal bars** (default): one row per species, in table order (first row at the top), months January to December
  from left to right. This layout is easier to read on a phone or with many species.
- **Wheel:** month 12 at the top, months clockwise, one ring per species (first row innermost).
Everything runs in the browser; the data is never uploaded.

**Sample file:** [sample.csv](sample.csv) (invented example data, Thai species names).

## Input format

One row per species. The first column is the name, followed by one column per month.

| Animal     | 1  | 2  | 3  | 4  | 5  | 6  | 7  | 8  | 9  | 10 | 11 | 12 |
|------------|----|----|----|----|----|----|----|----|----|----|----|----|
| ปูดำ        | 20 | 35 | 40 | 0  | 0  | 0  | 10 | 25 | 30 | 30 | 15 | 10 |
| กุ้งแชบ๊วย   | 0  | 0  | 5  | 15 | 30 | 40 | 20 | 0  | 0  | 0  | 0  | 0  |

- **Header row:** the first cell can be anything (e.g. `Animal`, `ชนิดสัตว์`). The month headers can be
  `1`–`12`, `Jan`–`Dec` (or full English names), or `ม.ค.`–`ธ.ค.` (or full Thai names), in any column order.
  Other columns, such as `Total`, are ignored. All 12 months must be present.
- **Values:** numbers such as `40`, `12.5`, `1,200` or `12,5`.
  - A blank cell, `0` or `-` means *no catch*, and that month is left empty on the ring.
  - Negative values and text such as `abc` are reported as errors, and the cell is highlighted in the table.
- **Absolute or percent:** the tool detects percentages if any value has a `%` sign, or if every row
  sums to 100. You can override this under *Display options → Values*.

## Ways to enter data

1. **Upload** a `.csv`, `.xlsx` or `.xls` file (the first sheet is used). CSV files can be UTF-8 or
   Thai Windows encoding (TIS-620 / Windows-874), and comma-, semicolon- or tab-separated.
2. **Paste** a table copied from Excel or Google Sheets, or CSV text, into the *Paste* tab.
3. **Edit** the on-page table directly. Pasting a block of cells into a table cell fills the table from that cell.
   Drag the ⋮⋮ handle to reorder rows (or focus it and press ↑ / ↓); the chart follows the table order.

## How the colours are calculated

- **Absolute values** are used as entered: the colour shows the catch in that month, and the legend
  shows each species' maximum month. There is no per-day conversion. Set the unit, such as kg, tonnes
  or individuals, under *Unit*.
- **Percentages** are used as relative intensity.
- **Global scale** (the default) uses one scale for every species, so you can compare species.
  **Per species** scales each species to its own maximum, which shows each season's shape more clearly.
- **Catch / no catch (0/1)** colours every month with a catch in the species' solid colour, ignoring the
  amount. Use it for presence data such as `1` = caught, `0` / blank = not caught; it is selected
  automatically when every value in a loaded table is 0 or 1.

## Output

- The layout you choose (wheel or bars) is the one that is exported.

- Download a **PNG** (high resolution, 2460 px wide) for reports and slides, or an **SVG** for editing.
  The SVG embeds the Thai font.
- Download the current table, including your edits and row order, as **CSV** with the button under the
  table (UTF-8 with a byte-order mark, so Excel shows Thai correctly). The CSV can be uploaded again later.
- *Reset table* restores the sample data; it asks first if you have edited the table.
- The language follows the species names (Thai if any name contains Thai characters). You can switch
  it with the *ภาษา / Language* buttons.

## Files

| File | Purpose |
|---|---|
| `app.html`, `app.css`, `app.js` | The standalone tool (embedded in `/tools/agro-calendar/` with an iframe) |
| `sample.csv` | Example input |
| `thumbnail.png` | Card image on `/tools/` |

Libraries (loaded from CDNs, pinned versions): D3 7.9.0, SheetJS 0.20.3 (only loaded when an Excel
file is uploaded), Noto Sans Thai (@fontsource 5.1.1).

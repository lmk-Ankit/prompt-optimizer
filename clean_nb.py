import json

with open('d:/Prompt_Enhancer/notebook.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

new_cells = []
for cell in nb['cells']:
    if cell['cell_type'] == 'markdown':
        continue
    
    # Clean up empty lines and print statements from code cells
    new_source = []
    for line in cell.get('source', []):
        if line.strip().startswith('#') and 'OPENROUTER_MODEL' not in line:
            # removing comments, except the ones strictly required
            pass
        elif 'print' in line or 'tqdm' in line:
            pass
        elif 'fig, ax' in line or 'plt.' in line or 'bars =' in line or 'ax.' in line:
            # removing visualization logic
            pass
        else:
            new_source.append(line)
            
    # keep only cells that actually have remaining code
    if any(s.strip() for s in new_source):
        # strip excessive whitespace / multiple newlines manually
        cleaned_source = []
        for line in new_source:
            # Basic pass to keep code readable but minimal
            cleaned_source.append(line)
            
        cell['source'] = cleaned_source
        cell['outputs'] = [] # clear any execution output
        cell['execution_count'] = None
        new_cells.append(cell)

nb['cells'] = new_cells

with open('d:/Prompt_Enhancer/notebook_clean.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Saved clean notebook to notebook_clean.ipynb")

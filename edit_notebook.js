const fs = require('fs');
let content = fs.readFileSync('d:\\Prompt_Enhancer\\notebook.ipynb', 'utf8');
content = content.replace(
    /"# Free-tier model on OpenRouter\\n",\n                "OPENROUTER_MODEL = 'mistralai\/mistral-small-3.1-24b-instruct:free'\\n",/g,
    `"# OpenRouter Model\\n",\n                "OPENROUTER_MODEL = 'mistralai/mistral-small-creative'\\n",`
);

// I should also replace the instance without a comma if it's the last item in the list, though normally it has a comma or not.
content = content.replace(
    /"# Free-tier model on OpenRouter\\n",\n                "OPENROUTER_MODEL = 'mistralai\/mistral-small-3.1-24b-instruct:free'\\n"/g,
    `"# OpenRouter Model\\n",\n                "OPENROUTER_MODEL = 'mistralai/mistral-small-creative'\\n"`
);

// And another one at the end of the line:
content = content.replace(
    "OPENROUTER_MODEL = 'mistralai/mistral-small-3.1-24b-instruct:free'",
    "OPENROUTER_MODEL = 'mistralai/mistral-small-creative'"
);

fs.writeFileSync('d:\\Prompt_Enhancer\\notebook.ipynb', content, 'utf8');
console.log('Notebook updated.');

---
name: gptmd
version: 0.2.4
description: CLI to Generate Markdown Content with GPT
license: MIT
repository: "https://github.com/nathanclevenger/gpt-markdown-cli"
homepage: "https://github.com/nathanclevenger/gpt-markdown-cli#readme"
downloads:
  monthly: 4
published: "2023-03-26T10:38:54.241Z"
updated: "2023-03-28T11:53:01.955Z"
---

# gptmd - Generate Markdown Files & Folders with Chat GPT

To get started, first set your environment variables with your OpenAI API Key:

```bash
export OPENAI_API_KEY=sk-...
```

Then you can call the `gptmd` CLI:

```bash
npx gptmd
```

Then select the content you want to generate:

```bash
   ____ ____ _____ __  __ ____  
  / ___|  _ \_   _|  \/  |  _ \ 
 | |  _| |_) || | | |\/| | | | |
 | |_| |  __/ | | | |  | | |_| |
  \____|_|    |_| |_|  |_|____/ 
                                
? What type of content do you want to generate? (Use arrow keys)
❯ Articles 
  Blog Posts 
  Book 
  Documentation 
  Email Sequence 
  Landing Pages 
  Other 
  Newsletter 
  Products 
  Videos 
```

You can also bypass the prompts and pass in the content type as an argument:

```bash
npx gptmd blog "The impact of AI on the future of work" --number 50 --words 1200 --output pages/posts
```

```
Usage: gptmd [options] [command]

CLI to Generate Markdown Content with GPT

Options:
  -V, --version                                  output the version number
  -h, --help                                     display help for command

Commands:
  articles [options] [topic]                     Articles
  blog [options] [topic]                         Blog Posts
  book [options] [topic]                         Book
  docs [options] [topic]                         Documentation
  emails [options] [topic]                       Email Sequence
  landing [options] [topic]                      Landing Pages
  other [options] [contentName] [title] [topic]  Other
  newsletter [options] [topic]                   Newsletter
  products [options] [topic]                     Products
  videos [options] [topic]                       Videos
```
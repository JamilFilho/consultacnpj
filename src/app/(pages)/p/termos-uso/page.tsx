import fs from "fs"
import path from "path"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export const metadata = {
  title: "Termos de Uso — BaseCNPJ",
}

export default function Page() {
  const filePath = path.join(
    process.cwd(),
    "src/content/termos-uso.md"
  )
  const markdown = fs.readFileSync(filePath, "utf-8")

  return (
    <article className="page">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </article>
  )
}
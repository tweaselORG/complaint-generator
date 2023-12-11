#let tweaselStyle(doc) = [
  #set page(numbering: (current, total) => "Page " + str(current) + " of " + str(total), number-align: end)
  #set text(font: "Linux Libertine", size: 12pt, lang: "en")
  #set heading(numbering: "1.1.")
  #show link: underline
  #set text(hyphenate: true)
  #set enum(numbering: "a.")

  #doc
]

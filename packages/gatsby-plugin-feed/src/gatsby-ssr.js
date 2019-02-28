import React from "react"
import { withPrefix } from "gatsby"
import { defaultOptions } from "./internals"

exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  const { feeds } = {
    ...defaultOptions,
    ...pluginOptions,
  }

  const links = feeds.map(({ output, title }, i) => (
    <link
      key={`gatsby-plugin-feed-${i}`}
      rel="alternate"
      type="application/rss+xml"
      title={title}
      href={withPrefix(output)}
    />
  ))

  setHeadComponents(links)
}

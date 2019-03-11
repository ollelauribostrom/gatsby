jest.mock(`react-dom/server`)
jest.mock(`glamor/server`)

import React from "react"
import ReactDOM from "react-dom/server"
import * as glamor from "glamor/server"
import { replaceRenderer } from "../gatsby-ssr"

const setup = () => {
  const bodyComponent = <div />
  const replaceBodyHTMLString = jest.fn()
  const setHeadComponents = jest.fn()

  glamor.renderStaticOptimized = jest.fn(fn => fn())
  ReactDOM.renderToString = jest.fn(() => {
    return {
      html: `mock-html`,
      css: `mock-css`,
      ids: `mock-ids`,
    }
  })

  return { bodyComponent, replaceBodyHTMLString, setHeadComponents }
}

describe(`gatsby-plugin-glamor`, () => {
  describe(`replaceRenderer`, () => {
    it(`renders the correct html`, () => {
      const args = setup()

      replaceRenderer(args)

      expect(ReactDOM.renderToString).toHaveBeenCalledTimes(1)
      expect(ReactDOM.renderToString).toHaveBeenCalledWith(args.bodyComponent)
      expect(args.replaceBodyHTMLString).toHaveBeenCalledWith(`mock-html`)
    })

    it(`sets the correct head components`, () => {
      const args = setup()

      replaceRenderer(args)

      expect(args.setHeadComponents).toHaveBeenCalledTimes(1)
      expect(args.setHeadComponents.mock.calls).toMatchSnapshot()
    })
  })
})

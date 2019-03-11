jest.mock(`glamor`)

import { onClientEntry } from "../gatsby-browser"
import * as glamor from "glamor"

describe(`gatsby-plugin-glamor`, () => {
  describe(`onClientEntry`, () => {
    it(`calls rehydrate if window._glamor is defined`, () => {
      window._glamor = {}
      glamor.rehydrate = jest.fn()

      onClientEntry()

      expect(glamor.rehydrate).toHaveBeenCalledWith(window._glamor)
    })

    it(`does not calls rehydrate if window._glamor is undefined`, () => {
      window._glamor = undefined
      glamor.rehydrate = jest.fn()

      onClientEntry()

      expect(glamor.rehydrate).not.toHaveBeenCalled()
    })
  })
})

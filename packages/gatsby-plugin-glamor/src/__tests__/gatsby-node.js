import { onCreateWebpackConfig, onCreateBabelConfig } from "../gatsby-node"

describe(`gatsby-plugin-glamor`, () => {
  describe(`onCreateWebpackConfig`, () => {
    it(`sets the correct webpack config`, () => {
      const actions = { setWebpackConfig: jest.fn() }
      const plugins = { provide: arg => arg }

      onCreateWebpackConfig({ actions, plugins })

      expect(actions.setWebpackConfig).toHaveBeenCalledWith({
        plugins: [
          {
            Glamor: `glamor/react`,
          },
        ],
      })
    })
  })

  describe(`onCreateBabelConfig`, () => {
    it(`sets the correct babel plugins`, () => {
      const actions = { setBabelPlugin: jest.fn(), setBabelPreset: jest.fn() }

      onCreateBabelConfig({ actions })

      expect(actions.setBabelPlugin).toHaveBeenCalledWith({
        name: `glamor/babel-hoist`,
      })
    })

    it(`sets the correct babel presets`, () => {
      const actions = { setBabelPlugin: jest.fn(), setBabelPreset: jest.fn() }

      onCreateBabelConfig({ actions })

      expect(actions.setBabelPreset).toHaveBeenCalledWith({
        name: `@babel/preset-react`,
        options: {
          pragma: `Glamor.createElement`,
        },
      })
    })
  })
})

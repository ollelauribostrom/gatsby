const siteData = {
  site: {
    siteMetadata: {
      title: `a sample title`,
      description: `a description`,
      siteUrl: `http://dummy.url/`,
    },
  },
}

export const createDefaultQueryResult = () => ({
  data: {
    ...siteData,
    allMarkdownRemark: {
      edges: [
        {
          node: {
            fields: {
              slug: `a-slug`,
            },
            excerpt: `post description`,
          },
        },
      ],
    },
  },
})

export const createCustomQueryResult = () => ({
  data: {
    ...siteData,
    allMarkdownRemark: {
      edges: [
        {
          node: {
            frontmatter: {
              path: `a-custom-path`,
            },
            excerpt: `post description`,
          },
        },
        {
          node: {
            frontmatter: {
              path: `another-custom-path`,
            },
            excerpt: `post description`,
          },
        },
      ],
    },
  },
})

export const createCustomSerializer = () => ({ query: { site, allMarkdownRemark } }) =>
  allMarkdownRemark.edges.map(edge => {
    return {
      ...edge.node.frontmatter,
      description: edge.node.excerpt,
      url: site.siteMetadata.siteUrl + edge.node.frontmatter.path,
    }
  })

export const createCustomQuery = () => `
  {
    allMarkdownRemark(
      limit: 1000,
    ) {
      edges {
        node {
          frontmatter {
            path
          }
          excerpt
        }
      }
    }
  }
`

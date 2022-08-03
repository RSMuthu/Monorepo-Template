export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' }, // all actions expected startwith "on"
  layout: 'centered', // component / story display position on the story page
  controls: { // controls for different essential addons
    // The controls can be set on the *.stories.js file itself.
    // The below mathers are for automatching
    matchers: {
      color: /(background|color)$/i, // prop matching this will be color input
      date: /Date$/, // prop matching this will be a date input
    },
  },
}

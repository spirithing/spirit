Object
  .entries(import.meta.glob('./effects/*.ts', {}))
  .forEach(([path, effect]) => {
    console.log('effect', path, effect())
  })

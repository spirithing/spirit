Object
  .values(import.meta.glob('./effects/*.ts'))
  .forEach(effect => effect())

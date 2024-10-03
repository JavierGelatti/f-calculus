export function subclassResponsibility(object, methodName) {
    throw new Error(`${object.constructor.name}#${methodName}: subclass responsibility`)
}

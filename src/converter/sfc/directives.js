import t from 'babel-types'

import { log, getIdentifier } from '../utils'
import { getNextJSXElment } from './sfc-ast-helpers'
import eventMap from './event-map'

export const handleIfDirective = function (path, value, state) {
    const parentPath = path.parentPath.parentPath
    // const childs = parentPath.node.children

    // Get JSXElment of v-else
    const nextElement = getNextJSXElment(parentPath)
    const test = state.computeds[value]
? t.identifier(value)
: t.memberExpression(
        t.memberExpression(t.thisExpression(), getIdentifier(state, value)),
        t.identifier(value)
    )

    parentPath.replaceWith(
        t.jSXExpressionContainer(
            t.conditionalExpression(
                test,
                parentPath.node,
                nextElement || t.nullLiteral()
            )
        )
    )

    path.remove()
}

export const handleShowDirective = function (path, value, state) {
    const test = state.computeds[value]
? t.identifier(value)
: t.memberExpression(
        t.memberExpression(t.thisExpression(), getIdentifier(state, value)),
        t.identifier(value)
    )

    path.replaceWith(
        t.jSXAttribute(
            t.jSXIdentifier('style'),
            t.jSXExpressionContainer(
                t.objectExpression([
                    t.objectProperty(
                        t.identifier('display'),
                        t.conditionalExpression(
                            test,
                            t.stringLiteral('block'),
                            t.stringLiteral('none')
                        )
                    )
                ])
            )
        )
    )
}

export const handleOnDirective = function (path, name, value) {
    const eventName = eventMap[name]
    if (!eventName) {
        log('Not support event name')
        return
    }

    path.replaceWith(
        t.jSXAttribute(
            t.jSXIdentifier(eventName),
            t.jSXExpressionContainer(
                t.memberExpression(
                    t.thisExpression(),
                    t.identifier(value)
                )
            )
        )
    )
}

export const handleBindDirective = function (path, name, value, state) {
    if (state.computeds[value]) {
        path.replaceWith(
            t.jSXAttribute(
                t.jSXIdentifier(name),
                t.jSXExpressionContainer(t.identifier(value))
            )
        )
        return
    }
    path.replaceWith(
        t.jSXAttribute(
            t.jSXIdentifier(name),
            t.jSXExpressionContainer(
                t.memberExpression(
                    t.memberExpression(t.thisExpression(), getIdentifier(state, value)),
                    t.identifier(value)
                )
            )
        )
    )
}

export const handleForDirective = function (path, value, definedInFor, state) {
    const parentPath = path.parentPath.parentPath
    const childs = parentPath.node.children
    const element = parentPath.node.openingElement.name.name

    const a = value.split(/\s+?in\s+?/)
    const prop = a[1].trim()

    const params = a[0].replace('(', '').replace(')', '').split(',')
    const newParams = []
    params.forEach((item) => {
        definedInFor.push(item.trim())
        newParams.push(t.identifier(item.trim()))
    })

    const member = state.computeds[prop]
? t.identifier(prop)
: t.memberExpression(
        t.memberExpression(t.thisExpression(), getIdentifier(state, value)),
        t.identifier(prop)
    )

    parentPath.replaceWith(
        t.jSXExpressionContainer(
            t.callExpression(
                t.memberExpression(
                    member,
                    t.identifier('map')
                ),
                [
                    t.arrowFunctionExpression(
                        newParams,
                        t.blockStatement([
                            t.returnStatement(
                                t.jSXElement(
                                    t.jSXOpeningElement(t.jSXIdentifier(element), [
                                        t.jSXAttribute(
                                            t.jSXIdentifier('key'),
                                            t.jSXExpressionContainer(
                                                t.identifier('index')
                                            )
                                        )
                                    ]),
                                    t.jSXClosingElement(t.jSXIdentifier(element)),
                                    childs
                                )
                            )
                        ])
                    )
                ]
            )
        )
    )
}

export const handleTextDirective = function (path, value, state) {
    const parentPath = path.parentPath.parentPath

    if (state.computeds[value]) {
        parentPath.node.children.push(
            t.jSXExpressionContainer(
                t.callExpression(
                    t.memberExpression(
                        t.identifier(value),
                        t.identifier('replace')
                    ),
                    [
                        t.regExpLiteral('<[^>]+>', 'g'),
                        t.stringLiteral('')
                    ]
                )
            )
        )
        return
    }

    parentPath.node.children.push(
        t.jSXExpressionContainer(
            t.callExpression(
                t.memberExpression(
                    t.memberExpression(
                        t.memberExpression(t.thisExpression(), getIdentifier(state, value)),
                        t.identifier(value)
                    ),
                    t.identifier('replace')
                ),
                [
                    t.regExpLiteral('<[^>]+>', 'g'),
                    t.stringLiteral('')
                ]
            )
        )
    )
}

export const handleHTMLDirective = function (path, value, state) {
    const val = state.computeds[value]
? t.identifier(value)
: t.memberExpression(
        t.memberExpression(t.thisExpression(), getIdentifier(state, value)),
        t.identifier(value)
    )

    path.replaceWith(
        t.jSXAttribute(
            t.jSXIdentifier('dangerouslySetInnerHTML'),
            t.jSXExpressionContainer(
                t.objectExpression(
                    [
                        t.objectProperty(t.identifier('__html'), val)
                    ]
                )
            )
        )
    )
}

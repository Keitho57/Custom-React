/* eslint-disable no-unused-expressions */
/* eslint-disable react/style-prop-object */

/**
 * 
 * @param {String} type - tagType e.g. div
 * @param {Object} props - 
 * @param  {Array} children -
 * @returns Object{type, props}
 */
function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map((child) => 
                //If child not an obj then create unique object TEXT_ELEMENT
                typeof child === 'object'
                    ? child
                    : createTextElement(child)
            )
        },
    }
}

function createTextElement(text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: [],
        }
    }
}

function createDom(fiber) {
    const dom = 
        fiber.type === 'TEXT_ELEMENT'
        ? document.createTextNode('')
        : document.createElement(fiber.type)

    const isProperty = key => key !== 'children'

    Object.keys(fiber.props)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = fiber.props[name]
        })

    return dom
}

function commitRoot() {
    commitWork(wipRoot.child)
    wipRoot = null
}

function commitRoot(fiber) {
    if(!fiber) return

    const domParent = fiber.parent.dom
    domParent.appendChild(fiber.dom)
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        }
    }

    nextUnitOfWork = wipRoot
}

let wipRoot = null
let nextUnitOfWork = null

function workLoop(deadline) {
    let shouldYield = false
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(
            nextUnitOfWork
        )

        shouldYield = deadline.timeRemaining() < 1
    }

    if(!nextUnitOfWork && wipRoot) {
        commitRoot()
    }
    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber){
    // add dom node
    if(!fiber.dom) {
        fiber.dom = createDom(fiber)
    }

    // create new fibers
    const elements = fiber.props.children
    let index = 0
    let prevSibling = null

    while(index < elements.length) {
        const element = elements[index]

        const newFiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null,
        }

        if(index === 0) {
            fiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber
        }
    
        prevSibling = newFiber
        index++
    }


    // return next unit of work
    if(fiber.child) {
        return fiber.child
    }

    let nextFiber = fiber
    while(nextFiber) {
        if(nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
}

const Midas = {
    createElement,
    render
}

/** @jsx Midas.createElement */
const element = (
    <div style="background: salmon">
      <h1>Hello World</h1>
      <h2 style="text-align:right">from Didact</h2>
    </div>
);

const container = document.getElementById("root")
Midas.render(element, container)
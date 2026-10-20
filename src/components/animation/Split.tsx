import { createElement, Fragment, type ElementType } from 'react'

interface Props {
  as?: ElementType
  text: string
  className?: string
  id?: string
}

/**
 * Accessible word-mask heading. The full text stays in aria-label (and the
 * visually-split spans are aria-hidden), so screen readers and
 * reduced-motion users get the untouched heading. "\n" becomes a line break.
 */
export default function Split({ as = 'h2', text, className, id }: Props) {
  const lines = text.split('\n')
  return createElement(
    as,
    { className, id, 'data-split': true, 'aria-label': text.replace(/\n/g, ' ') },
    lines.map((line, li) => (
      <span key={li} aria-hidden="true" className="split-line">
        {line.split(' ').map((word, wi) => (
          <Fragment key={wi}>
            <span className="w"><span>{word}</span></span>
            {' '}
          </Fragment>
        ))}
        {li < lines.length - 1 && <br />}
      </span>
    )),
  )
}

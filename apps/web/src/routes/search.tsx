import { createFileRoute } from '@tanstack/react-router'
import { useSearchPaste } from '../hooks/use-search-paste';
import { useState } from 'react';
import { SearchSchema, type Paste } from '@pastebin/shared';

export const Route = createFileRoute('/search')({
  component: SearchPaste,
})

function SearchPaste() {
  const [keyword, setKeyword] = useState<string>('')
  const [result, setResult] = useState<Paste[]>([])
  const [errMsg, setErrMsg] = useState<string>('')

  const searchReq = async () => {

    const check = SearchSchema.safeParse(keyword);
    if (!check.success) {
      setErrMsg('Keyword length should between 1-100 character')
      return
    }

    const { data, isLoading, isError, error } = useSearchPaste(keyword)
    if (isError)
      console.log(error)
      setErrMsg(error?.message || 'Try again')
    if (data)
      setResult(data)
  }

  return (
    <div>

      <div>
        <div>
          <input type="text"
            onChange={(ev) => {
              setKeyword(ev.target.value)
            }}
          />
        </div>

        <div>
          <button
            onClick={searchReq}
          >
            Search
          </button>
        </div>
      </div>

      <div>
        {
          result.map((el, idx) => {
            return (
              <div key={idx}>{el.title} {el.content}</div>
            )
          })
        }
      </div>
    </div>
  )
}


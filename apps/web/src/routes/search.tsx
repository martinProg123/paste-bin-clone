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
  const { data, isLoading, isError, error, refetch } = useSearchPaste(keyword);

  const searchReq = async () => {
    const check = SearchSchema.safeParse({ keyword });
    if (!check.success) {
      setErrMsg(check.error.errors[0].message)
      return
    }
    setErrMsg('');
    refetch();

    if (isError) {
      console.log(error)
      setErrMsg(error?.message || 'Try again')
    }
    if (data && data.length > 0)
      setResult(data)
    else
      setErrMsg('Not Found')
    console.log(data)
  }

  return (
    <div>
      <div>{errMsg || (isError ? (error as Error).message : '')}</div>
      {isLoading && <div>Searching...</div>}
      <div className='flex md:flex-row flex-col justify-center'>
        <div>
          <input type="text"

            className=' focus:outline-hidden  font-paste  bg-brand-slate  border border-brand-border rounded-sm p-2 md:w-xl w-full'

            onChange={(ev) => {
              setKeyword(ev.target.value)
            }}
          />
        </div>

        <div className='flex justify-end'>
          <button
          className='cursor-pointer bg-brand-green hover:bg-brand-green-hover text-white px-6 py-2 rounded-md font-medium transition-colors'
            onClick={searchReq}
          >
            Search
          </button>
        </div>
      </div>

      {/* results */}
      <div>
        {
          (result.length > 0) && result.map((el, idx) => {
            return (
              <div key={idx}>{el.title} {el.createdAt} {el.expiresAt}</div>
            )
          })
        }
      </div>
    </div>
  )
}


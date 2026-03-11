import { createFileRoute, Link } from '@tanstack/react-router'
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
    const { data: freshData, isError: hasError, error: fetchError } = await refetch();

    if (hasError) {
      console.log(fetchError)
      setErrMsg(fetchError?.message || 'Try again')
      return
    }
    if (freshData && freshData.length > 0)
      setResult(freshData)
    else {
      setResult([]);
      setErrMsg('Paste Not Found')
    }
    console.log(freshData)
  }

  return (
    <div>
      <div className='flex md:flex-row flex-col justify-center'>
        <div>
          <input type="text"

            className=' focus:outline-hidden  font-paste  bg-brand-slate  border border-brand-border rounded-sm p-2 md:w-xl w-full'
            onKeyDown={(ev) => {
              if (ev.key === 'Enter') {
                searchReq();
              }
            }}
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
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* results */}

      <div
        className='mt-4  '
      >
        {
          (errMsg || isError)
          &&
          <div className='text-center text-red-500 font-medium text-xl '>{errMsg}</div>
        }

        {
          (result.length > 0) &&
          <div className='bg-brand-slate  border border-brand-border rounded-sm'>

            {result.map((el, idx) => {
              return (
                <Link to='/pastes/$slug'
                  params={{ slug: el.slug }}
                >
                  <div
                    className=' p-2 px-6 border-b border-brand-border cursor-pointer hover:bg-[#262729] '
                    key={el.slug}>
                    <h2 className='text-white hover:underline '>
                      {el.title}
                    </h2>
                    <p className='text-brand-text-muted text-sm'>
                      Create: {new Date(el.createdAt).toLocaleString()} |
                      Expire: {el.expiresAt ? new Date(el.expiresAt).toLocaleString() : 'Never'}
                    </p>


                  </div>
                </Link>
              )
            })}


          </div>
        }
      </div>
      {/* 
      <div>{errMsg || (isError ? (error as Error).message : '')}</div> */}
    </div>
  )
}


export const Auth = () => {
  return(
    <div className="flex flex-col items-center justify-center h-screen">
      <div>Welcome to</div>
      <h1 className="text-3xl font-bold m-2">Cafinity!</h1>
      <div className="flex flex-col m-2">
        <input placeholder="Email..." />
        <input placeholder="Password..." />
      </div>
      <button className="m-2 bg-[#B07242] text-[#E7E4E1] transition-colors hover:bg-[#6490E1]">Sign in</button>
    </div>
  )
}
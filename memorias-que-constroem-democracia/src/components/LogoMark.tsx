export default function LogoMark({dark=false}:{dark?:boolean}) {
  return <div className={`logo-mark ${dark?'dark':''}`} aria-hidden="true"><span>✺</span><i></i></div>;
}

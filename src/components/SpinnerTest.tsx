import { ClipLoader, PulseLoader } from "react-spinners";
import { Loading, LoadingInline } from "./ui/loading";

export function SpinnerTest() {
  return (
    <div className="p-8 space-y-8 bg-white dark:bg-slate-950">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Spinner Test</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">ClipLoader Direct (Blue)</h3>
        <ClipLoader size={50} color="#4338ca" />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Loading Component</h3>
        <Loading message="Test loading..." />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">LoadingInline (Button)</h3>
        <div className="flex items-center bg-slate-900 text-white px-4 py-2 rounded">
          <LoadingInline />
          <span className="ml-2">Loading button...</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Different Sizes</h3>
        <div className="flex items-center space-x-8">
          <ClipLoader size={30} color="#4338ca" />
          <ClipLoader size={50} color="#4338ca" />
          <ClipLoader size={70} color="#4338ca" />
        </div>
      </div>
    </div>
  );
}
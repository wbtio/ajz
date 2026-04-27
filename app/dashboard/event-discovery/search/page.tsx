import { SearchForm } from './components/search-form'

export default function SearchPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium leading-6 text-stone-900">New Search Session</h2>
                <p className="mt-1 text-sm text-stone-500">
                    Define your criteria to find relevant events.
                </p>
            </div>
            
            <SearchForm />
        </div>
    )
}

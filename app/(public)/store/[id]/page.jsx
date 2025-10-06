export default async function page(props){
    const { id: _id } = await props.params; // code mode generateed
  const id = Array.isArray(_id) ? _id[0] : String(_id || '');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50/30">

        </div>
    )
}
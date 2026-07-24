interface Props {
  params: Promise<{
    id:string;
  }>;
}


export default async function SwapRequestDetailPage({
  params,
}:Props){

  const {id} = await params;


  return (
    <main>
      <h1>
        Swap Request Detail
      </h1>

      <p>
        Request ID: {id}
      </p>
    </main>
  );
}
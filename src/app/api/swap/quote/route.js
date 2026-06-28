export async function GET(request) {

  const {searchParams}=new URL(request.url);


  const inputMint =
    searchParams.get("inputMint");


  const outputMint =
    searchParams.get("outputMint");


  const amount =
    searchParams.get("amount");



  const url =
  `https://lite-api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`;



  try {


    const res = await fetch(url);


    const text = await res.text();



    console.log(
      "QUOTE:",
      text
    );



    return Response.json(
      JSON.parse(text)
    );


  } catch(error){


    console.error(
      "QUOTE ERROR:",
      error
    );


    return Response.json(
      {
        error:error.message
      },
      {
        status:500
      }
    );

  }

}
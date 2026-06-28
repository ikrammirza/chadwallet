export async function POST(request) {
  try {
    const body = await request.json();

    const {
      quoteResponse,
      userPublicKey,
    } = body;


    if (!quoteResponse || !userPublicKey) {
      return Response.json(
        {
          error: "Missing quoteResponse or userPublicKey"
        },
        {
          status: 400
        }
      );
    }


    const url = "https://lite-api.jup.ag/swap/v1/swap";


    console.log("Jupiter swap request:", {
      userPublicKey,
      inputMint: quoteResponse.inputMint,
      outputMint: quoteResponse.outputMint,
    });



    const res = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },


      body: JSON.stringify({

        quoteResponse,

        userPublicKey,

        wrapAndUnwrapSol: true,

      }),
    });



    const text = await res.text();


    console.log("Jupiter build status:", res.status);

    console.log(
      "Jupiter build response:",
      text
    );


    if (!res.ok) {

      return Response.json(
        {
          error: text
        },
        {
          status: res.status
        }
      );

    }



    const data = JSON.parse(text);



    return Response.json(data);


  } catch(error) {


    console.error(
      "BUILD ERROR:",
      error
    );


    return Response.json(
      {
        error: error.message
      },
      {
        status:500
      }
    );

  }
}
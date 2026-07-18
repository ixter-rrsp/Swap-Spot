export async function createSwapRequest(
  offeredListingId: string,
  requestedListingId: string
) {

  const response =
    await fetch(
      "/api/swap-requests",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          offeredListingId,
          requestedListingId,
        }),
      }
    );


  const result =
    await response.json();


  if (!response.ok) {

    throw new Error(
      result.error ??
      "Failed to create swap request."
    );

  }


  return result;

}



export async function acceptSwapRequest(
  requestId: string
) {

  const response =
    await fetch(
      `/api/swap-requests/${requestId}/accept`,
      {
        method: "PATCH",
      }
    );


  const result =
    await response.json();


  if (!response.ok) {

    throw new Error(
      result.error ??
      "Failed to accept swap request."
    );

  }


  return result;

}



export async function declineSwapRequest(
  requestId: string
) {

  const response =
    await fetch(
      `/api/swap-requests/${requestId}/decline`,
      {
        method: "PATCH",
      }
    );


  const result =
    await response.json();


  if (!response.ok) {

    throw new Error(
      result.error ??
      "Failed to decline swap request."
    );

  }


  return result;

}



export async function cancelSwapRequest(
  requestId: string
) {

  const response =
    await fetch(
      `/api/swap-requests/${requestId}/cancel`,
      {
        method: "PATCH",
      }
    );


  const result =
    await response.json();


  if (!response.ok) {

    throw new Error(
      result.error ??
      "Failed to cancel swap request."
    );

  }


  return result;

}
import Event from "../models/Event.js";

export const event_it = (req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  res.on("finish", () => {
    // Assuming you have the required data for the event
    const eventType = "activity";
    const coordinates = req.coordinates;
    const storeId = req.store_id; // The ID of the associated store
    const userId = req.user ? req.user._id : null; // The ID of the associated user
    const description = req.method;
    const requestPath = req.path;
    const requestData = JSON.stringify({
      query: req.query,
      data: req.body,
      params: req.params,
    });
    const responseStatus = res.statusCode;

    // Create a new event instance
    const event = new Event({
      type: eventType,
      coordinates: coordinates,
      store: storeId,
      user: userId,
      description: description,
      request_path: requestPath,
      request_data: requestData,
      response_status: responseStatus,
      error_desc: [200, 201].includes(responseStatus) ? "Successful" : "",
    });

    // Save the event to the database
    event
      .save()
      .then((savedEvent) => {
        console.log("Event saved successfully:", savedEvent.type);
      })
      .catch((error) => {
        console.error("Failed to save event:", error);
      });
  });

  // Call the next middleware in the chain
  next();
};

export const event_store_activity = async (req, res, next) => {
  res.on("finish", () => {
    if (res.locals.store) {
      const coordinates = req.coordinates;
      const storeId = res.locals.store._id;
      const userId = req.user;
      const description = req.method;
      const requestPath = req.path;
      const requestData = JSON.stringify({
        query: req.query,
        data: req.body,
        params: req.params,
      });
      const responseStatus = res.statusCode;
      const eventType = res.locals.event_type;

      const event = new Event({
        type: eventType,
        coordinates: coordinates,
        store: storeId,
        user: userId,
        description: description,
        request_path: requestPath,
        request_data: requestData,
        response_status: responseStatus,
        error_desc: [200, 201].includes(responseStatus) ? "Successful" : "",
      });

      event
        .save()
        .then((savedEvent) => {
          console.log("Event saved successfully:", event.type);
        })
        .catch((error) => {
          console.error("Failed to save event:", error);
        });
    }
  });

  next();
};

module.exports = mongoose => {
    const Tutorial = mongoose.model(

      // collection name 
      "tutorial",

      // model
      mongoose.Schema(
        {
          title: String,
          description: String,
          published: Boolean
        },
        { timestamps: true }
      )
    );

    return Tutorial;
  };
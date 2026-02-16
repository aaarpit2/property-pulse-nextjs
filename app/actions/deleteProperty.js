"use server";
import connectDB from "@/config/database";
import Property from "@/models/Property";
import { getSessionUser } from "@/utils/getSessionUser";
import { revalidatePath } from "next/cache";

async function deleteProperty(propertyId) {
  await connectDB();
  const sessionUser = await getSessionUser();

  if (!sessionUser || !sessionUser.userId) {
    throw new Error("Use ID is required");
  }

  const { userId } = sessionUser;

  const property = await Property.findById(propertyId);

  if (!property) throw new Error("Property Not Found");

  //verify ownership

  if (property.owner.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  //Extarct public IDs from image  URLS to delete images from cloudfoundary

  await property.deleteOne();

  revalidatePath("/", "layout");
}

export default deleteProperty;

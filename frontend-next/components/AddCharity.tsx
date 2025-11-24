"use client";
import React, { useContext, useState } from "react";
import { FormContext } from "@/context/FormContext";
import { useRouter } from "next/router";

function AddCharity({
  setShowModal,
  charityId,
  initialData,
}: {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  charityId?: number;
  initialData?: any;
}) {
  const { handleChange, handleSubmit, setFormData, updateCharity, updateCharityAllowInactive, formData } = useContext(FormContext) as any;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();
  const refreshData = () => {
    router.replace(router.asPath);
  };

  const handleSubmitForm = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setIsSubmitting(true);
    if (typeof charityId !== "undefined") {
      // Edit mode: call the appropriate contract method. For inactive charities
      // call `updateCharityAllowInactive` (requires updated contract deployed).
      try {
        if (initialData && initialData.active === false && updateCharityAllowInactive) {
          await updateCharityAllowInactive(
            Number(charityId),
            formData.name,
            formData.mission,
            formData.website,
            formData.active,
            formData.wallet
          );
        } else {
          await updateCharity(
            Number(charityId),
            formData.name,
            formData.mission,
            formData.website,
            formData.active,
            formData.wallet
          );
        }
      } catch (err: any) {
        console.error("updateCharity error:", err);
        setErrorMsg(err?.message || "Failed to update charity");
        setIsSubmitting(false);
        return;
      }
    } else {
      await handleSubmit(e);
    }
    refreshData();
    setShowModal(false);
    setIsSubmitting(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // persist data URL into formData
      setFormData((prev: any) => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  // Prefill form in edit mode
  React.useEffect(() => {
    if (initialData) {
      // initialData may include image/description etc.
      // Normalize fields we care about to plain values
      const normalized: any = {
        name: initialData.name || "",
        mission: initialData.mission || "",
        website: initialData.website || "",
        active: typeof initialData.active !== "undefined" ? Boolean(initialData.active) : false,
        wallet: initialData.wallet || "",
        image: initialData.image || "",
        description: initialData.description || "",
      };
      setFormData((prev: any) => ({ ...prev, ...normalized }));
    }
  }, [initialData, setFormData]);

  const isEdit = typeof charityId !== "undefined";



  return (
    // TODO: Make a separate Modal component and pass children into it for more reusabilty
    <div
      id="wrapper"
      // Added z-40 to elevate the modal above the header
      className="fixed inset-0 z-40 bg-gray-100 bg-opacity-30 backdrop-blur-[3px] flex justify-center items-center"
      onClick={() => setShowModal(false)}
    >
      <div className="flex items-center justify-center w-full h-full px-4 py-5 sm:p-6">
        <div
          className="w-full max-w-[80rem] max-h-[80vh] overflow-y-auto bg-white shadow-lg rounded-xl"
          onClick={(e) => {
            // do not close modal if anything inside modal content is clicked
            e.stopPropagation();
          }}
        >
          <div className="px-6 py-6 sm:p-8">
            <p className="text-xl font-bold text-gray-900">{isEdit ? "Edit Charity" : "Create Charity"}</p>
            <p className="mt-3 text-sm font-medium text-gray-500">
              Only admins are allowed to add a new charity organization.
            </p>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700">
                {errorMsg}
              </div>
            )}

            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="" className="text-sm font-bold text-gray-900">Name</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Rain & Earth"
                      value={formData?.name || ""}
                      className="block w-full px-4 py-3 placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm caret-indigo-600"
                      onChange={(e) => handleChange(e, e.currentTarget.name)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mission" className="text-sm font-bold text-gray-900">Mission</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="mission"
                      id="mission"
                      placeholder="Sustainable Agriculture"
                      value={formData?.mission || ""}
                      className="block w-full px-4 py-3 placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm caret-indigo-600"
                      onChange={(e) => handleChange(e, e.currentTarget.name)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="website" className="text-sm font-bold text-gray-900">Website</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="website"
                      id="website"
                      placeholder="www.sustainableagric.org"
                      value={formData?.website || ""}
                      className="block w-full px-4 py-3 placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm caret-indigo-600"
                      onChange={(e) => handleChange(e, e.currentTarget.name)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="wallet" className="text-sm font-bold text-gray-900">Wallet Address</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="wallet"
                      id="wallet"
                      placeholder="0x00000000000000000000000000000000"
                      value={formData?.wallet || ""}
                      className="block w-full px-4 py-3 placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm caret-indigo-600"
                      onChange={(e) => handleChange(e, e.currentTarget.name)}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="image" className="text-sm font-bold text-gray-900">Background Image</label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Or paste an image URL below</p>
                    <input
                      type="text"
                      name="image"
                      id="image"
                      placeholder="https://example.com/image.jpg"
                      value={formData?.image || ""}
                      className="mt-2 block w-full px-4 py-3 placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm caret-indigo-600"
                      onChange={(e) => handleChange(e, e.currentTarget.name)}
                    />
                  </div>
                  {formData?.image && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500">Preview:</p>
                      <img src={formData.image} alt="preview" className="w-full h-36 object-cover rounded-md mt-2" />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="text-sm font-bold text-gray-900">Description</label>
                  <div className="mt-2">
                    <textarea
                      name="description"
                      id="description"
                      placeholder="A longer description about the charity and project..."
                      rows={5}
                      value={formData?.description || ""}
                      className="block w-full px-4 py-3 placeholder-gray-500 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm caret-indigo-600"
                      onChange={(e) => handleChange(e, e.currentTarget.name)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-4 space-x-5">
                    <label
                      htmlFor="activate-checkbox"
                      className="ext-sm font-bold text-gray-900"
                    >
                      Activate now
                    </label>
                    <input
                      id="activate-checkbox"
                      type="checkbox"
                      name="active"
                      checked={Boolean(formData?.active)}
                      className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-2  focus:ring-indigo-600 focus:border-indigo-600 caret-indigo-600"
                      onChange={(e) => handleChange(e, e.currentTarget.name)}
                    />
                  </div>

                </div>

              </div>

              <div className="flex items-center justify-end mt-5 space-x-4">
                <button
                  type="reset"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold leading-5 text-gray-600 transition-all duration-200 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>

                {!isSubmitting ? (
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold leading-5 text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500"
                    onClick={(e) => handleSubmitForm(e)}
                  >
                    {isEdit ? "Update" : "Add"}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold leading-5 text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-md animate-pulse focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500 cursor-not-allowed pointer-events-none"
                  >
                    {isEdit ? "Update" : "Add"}
                  </button>
                )}
                {/* <button
                  type="submit"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold leading-5 text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500"
                  onClick={(e) => handleSubmitForm(e)}
                >
                  Add
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddCharity;

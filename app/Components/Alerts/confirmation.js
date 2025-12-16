import "sweetalert2/dist/sweetalert2.all";
import Swal from "sweetalert2";

// Simple confirmation alert, similar signature style to successAlert
export function showConfirmation({
  title = "Are you sure?",
  text,
  confirmText = "Yes, delete it!",
  cancelText = "Cancel",
  icon = "warning",
  successTitle = "Deleted!",
  successText,
  successIcon = "success"
}) {
  return Swal.fire({
    title: title,
    text: text,
    icon: icon,
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  }).then((result) => {
    if (result.isConfirmed) {
      return Swal.fire({
        title: successTitle,
        text: successText,
        icon: successIcon,
      });
    }
    return result;
  });
}

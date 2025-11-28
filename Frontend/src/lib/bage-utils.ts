export const getStatusBadgeVariant = (isActive: boolean): "bg-green-500" | "secondary" | "destructive" | "outline" => {
  return isActive ? "bg-green-500" : "destructive";
};

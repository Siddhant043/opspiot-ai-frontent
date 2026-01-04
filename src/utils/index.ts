export const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

export const formatFileType = (type: string) => {
  if (type.includes("pdf")) {
    return "PDF";
  }
  if (type.includes("text")) {
    return "TXT";
  }
  return type;
};

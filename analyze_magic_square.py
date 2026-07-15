# تحليل المصفوفة المعطاة
matrix = [
    [31, 36, 29, 76, 81, 74, 13, 18, 11],
    [30, 32, 34, 75, 77, 79, 12, 14, 16],
    [35, 28, 33, 80, 73, 78, 17, 10, 15],
    [22, 27, 20, 40, 45, 38, 58, 63, 56],
    [21, 23, 25, 39, 41, 43, 57, 59, 61],
    [26, 19, 24, 44, 37, 42, 62, 55, 60],
    [67, 72, 65,  4,  9,  2, 49, 54, 47],
    [66, 68, 70,  3,  5,  7, 48, 50, 52],
    [71, 64, 69,  8,  1,  6, 53, 46, 51]
]

print("المصفوفة المعطاة:")
for row in matrix:
    print(row)

# التحقق من مجموع الصفوف
print("\n--- مجموع الصفوف ---")
row_sums = [sum(row) for row in matrix]
for i, s in enumerate(row_sums):
    print(f"الصف {i+1}: {s}")

# التحقق من مجموع الأعمدة
print("\n--- مجموع الأعمدة ---")
col_sums = [sum(matrix[i][j] for i in range(9)) for j in range(9)]
for j, s in enumerate(col_sums):
    print(f"العمود {j+1}: {s}")

# التحقق من مجموع القطرين
print("\n--- مجموع الأقطار ---")
diag1 = sum(matrix[i][i] for i in range(9))
diag2 = sum(matrix[i][8-i] for i in range(9))
print(f"القطر الرئيسي: {diag1}")
print(f"القطر الثانوي: {diag2}")

# التحقق من وجود جميع الأرقام من 1 إلى 81
all_numbers = set()
for row in matrix:
    all_numbers.update(row)

expected_numbers = set(range(1, 82))
missing = expected_numbers - all_numbers
extra = all_numbers - expected_numbers

print(f"\n--- التحقق من الأرقام ---")
print(f"عدد الأرقام الفريدة: {len(all_numbers)}")
print(f"الأرقام المفقودة (إن وجدت): {missing if missing else 'لا يوجد'}")
print(f"الأرقام الزائدة (إن وجدت): {extra if extra else 'لا يوجد'}")

# حساب المجموع السحري المتوقع لمربع 9x9
# مجموع الأرقام من 1 إلى 81 = 81*82/2 = 3321
# المجموع السحري لكل صف/عمود = 3321/9 = 369
magic_constant = 369
print(f"\nالمجموع السحري المتوقع لمربع 9x9: {magic_constant}")

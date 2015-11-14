#!/usr/bin/python3

# algorithm kmp_search:
#     input:
#         an array of characters, S (the text to be searched)
#         an array of characters, W (the word sought)
#     output:
#         an integer (the zero-based position in S at which W is found)

#     define variables:
#         an integer, m ← 0 (the beginning of the current match in S)
#         an integer, i ← 0 (the position of the current character in W)
#         an array of integers, T (the table, computed elsewhere)

#     while m + i < length(S) do
#         if W[i] = S[m + i] then
#             if i = length(W) - 1 then
#                 return m
#             let i ← i + 1
#         else
#             if T[i] > -1 then
#                 let m ← m + i - T[i], i ← T[i]
#             else
#                 let i ← 0, m ← m + 1

#     (if we reach here, we have searched all of S unsuccessfully)
#     return the length of S
def kmp(s, w, t):

    m = 0
    i = 0
    while m + i < len(s):
        if w[i] == s[m + i]:
            if i == len(w) - 1:
                return m
            i = i + 1
        else:
            if t[i] > -1:
                m = m + i - t[i]
                i = t[i]
            else:
                i = 0
                m = m + 1




# algorithm kmp_table:
#     input:
#         an array of characters, W (the word to be analyzed)
#         an array of integers, T (the table to be filled)
#     output:
#         nothing (but during operation, it populates the table)

#     define variables:
#         an integer, pos ← 2 (the current position we are computing in T)
#         an integer, cnd ← 0 (the zero-based index in W of the next
# character of the current candidate substring)

#     (the first few values are fixed but different from what the algorithm
# might suggest)
#     let T[0] ← -1, T[1] ← 0

#     while pos < length(W) do
#         (first case: the substring continues)
#         if W[pos-1] = W[cnd] then
#             let T[pos] ← cnd + 1, cnd ← cnd + 1, pos ← pos + 1

#         (second case: it doesn't, but we can fall back)
#         else if cnd > 0 then
#             let cnd ← T[cnd]

#         (third case: we have run out of candidates.  Note cnd = 0)
#         else
#             let T[pos] ← 0, pos ← pos + 1

def kmpTb(w):
    t = []
    pos = 2
    cnd = 0
    t.append(-1)
    t.append(0)
    while pos < len(w):
        if w[pos-1] == w[cnd]:
            t[pos] = cnd + 1
            cnd = cnd + 1
            pos = pos + 1
        elif cnd > 0:
            cnd = t[cnd]
        else:
            t[pos] = 0
            pos = pos + 1
    return t

if __name__ == '__main__':
    s = b'1}}9\u6587\u80f8\u6\u5976\u5927\u79c0\u8eab\u6750"}}fesfefojji'
    w = b'}}'
    t = kmpTb(w)
    ppsition = kmp(s, w, t)
    print(ppsition)

with Interfaces;

--  Many tries of a rare event.
--
--  One player throws ten dice. The chance of ten sixes is 6**(-10).
--  The chance that at least one of N players does it is
--  -expm1(N * log1p(-p)). Lem's egg figures are a clutch of about
--  three million and one adult fish. The per-egg chance 1/3_000_000 is
--  our reading of those two figures. He does not state it.
package Ath_Sixes is
   pragma Compile_Time_Error
     (Long_Float'Size /= 64,
      "Ath_Sixes requires a binary64 Long_Float");

   Die_Count : constant := 10;

   Player_Min : constant Long_Float := 1.0;
   Player_Max : constant Long_Float := 1.0e9;

   Egg_Count  : constant Long_Float := 3.0e6;
   Egg_Adults : constant Long_Float := 1.0;
   Egg_Min    : constant Long_Float := 1.0;
   Egg_Max    : constant Long_Float := 3.0e7;

   Sample_Count : constant := 17;

   subtype Status_Code is Interfaces.Integer_32;
   Ok         : constant Status_Code := 0;
   Non_Finite : constant Status_Code := 1;
   Negative   : constant Status_Code := 2;
   Bad_Single : constant Status_Code := 3;

   Caption_Rare     : constant Interfaces.Integer_32 := 0;
   Caption_Unlikely : constant Interfaces.Integer_32 := 1;
   Caption_Possible : constant Interfaces.Integer_32 := 2;
   Caption_Sure     : constant Interfaces.Integer_32 := 3;

   type Sample_Values is array (1 .. Sample_Count) of Long_Float;

   function Single_Chance return Long_Float;
   function Egg_Single return Long_Float;

   procedure At_Least_One
     (Trials : Long_Float;
      Single : Long_Float;
      Chance : out Long_Float;
      Status : out Status_Code);

   function Players_Of (Slider : Long_Float) return Long_Float;
   function Slider_Of_Players (Players : Long_Float) return Long_Float;
   function Eggs_Of (Slider : Long_Float) return Long_Float;
   function Slider_Of_Eggs (Eggs : Long_Float) return Long_Float;

   function Caption (Chance : Long_Float) return Interfaces.Integer_32;

   procedure Player_Samples
     (Trials : out Sample_Values;
      Chance : out Sample_Values;
      X_Pos  : out Sample_Values);

   procedure Egg_Samples
     (Eggs   : out Sample_Values;
      Chance : out Sample_Values;
      Expect : out Sample_Values;
      X_Pos  : out Sample_Values);

   procedure Roll (Set_Index : Positive);
   function Face (Die : Positive) return Interfaces.Integer_32;
   function Six_Count return Interfaces.Integer_32;
end Ath_Sixes;

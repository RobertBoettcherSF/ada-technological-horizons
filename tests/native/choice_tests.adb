with Ada.Command_Line;
with Ada.Numerics.Long_Elementary_Functions;
with Ada.Text_IO;
with Ada.Unchecked_Conversion;
with Interfaces;
with Ath_Choice;
with Ath_Choice_Exports;

procedure Choice_Tests is
   use type Interfaces.Integer_32;
   use type Ath_Choice.Status_Code;

   Failures : Natural := 0;

   procedure Fail (Name : String) is
   begin
      Failures := Failures + 1;
      Ada.Text_IO.Put_Line ("FAIL " & Name);
   end Fail;

   procedure Run
     (Name : String;
      Possibilities, Repeats : Long_Float;
      Expected : Ath_Choice.Status_Code)
   is
      Bits_Per, Total_Bits, Code_Per, Code_Total : Long_Float;
      Combinations, Log10_Count : Long_Float;
      Combinations_Valid, Combinations_Exact, Code_Total_Valid : Boolean;
      X_Max, Y_Max : Long_Float;
      Repeats_Out : Ath_Choice.Sample_Repeats;
      Totals_Out : Ath_Choice.Sample_Bits;
      Status : Ath_Choice.Status_Code;
   begin
      Ath_Choice.Choose
        (Possibilities, Repeats, Bits_Per, Total_Bits, Code_Per, Code_Total,
         Combinations, Log10_Count, Combinations_Valid, Combinations_Exact,
         Code_Total_Valid, X_Max, Y_Max, Repeats_Out, Totals_Out, Status);
      if Status /= Expected then
         Fail (Name);
      end if;
      if Expected /= Ath_Choice.Ok and then
        (Bits_Per /= 0.0 or else Combinations_Valid or else Totals_Out (1) /= 0.0)
      then
         Fail (Name & "-cleared");
      end if;
   end Run;
begin
   declare
      Bits_Per, Total_Bits, Code_Per, Code_Total : Long_Float;
      Combinations, Log10_Count : Long_Float;
      Combinations_Valid, Combinations_Exact, Code_Total_Valid : Boolean;
      X_Max, Y_Max : Long_Float;
      Repeats_Out : Ath_Choice.Sample_Repeats;
      Totals_Out : Ath_Choice.Sample_Bits;
      Status : Ath_Choice.Status_Code;
   begin
      Ath_Choice.Choose
        (2.0, 8.0, Bits_Per, Total_Bits, Code_Per, Code_Total,
         Combinations, Log10_Count, Combinations_Valid, Combinations_Exact,
         Code_Total_Valid, X_Max, Y_Max, Repeats_Out, Totals_Out, Status);
      if Status /= Ath_Choice.Ok or else Bits_Per /= 1.0 or else Total_Bits /= 8.0
        or else Code_Per /= 1.0 or else Code_Total /= 8.0
        or else not Combinations_Exact or else Combinations /= 256.0
        or else Repeats_Out (Ath_Choice.Sample_Count) /= 8.0
        or else Totals_Out (Ath_Choice.Sample_Count) /= 8.0
        or else Totals_Out (1) /= 0.0
      then
         Fail ("coin");
      end if;
   end;

   declare
      Bits_Per, Total_Bits, Code_Per, Code_Total : Long_Float;
      Combinations, Log10_Count : Long_Float;
      Combinations_Valid, Combinations_Exact, Code_Total_Valid : Boolean;
      X_Max, Y_Max : Long_Float;
      Repeats_Out : Ath_Choice.Sample_Repeats;
      Totals_Out : Ath_Choice.Sample_Bits;
      Status : Ath_Choice.Status_Code;
      Ideal : constant Long_Float :=
        Ada.Numerics.Long_Elementary_Functions.Log (6.0)
        / Ada.Numerics.Long_Elementary_Functions.Log (2.0);
   begin
      Ath_Choice.Choose
        (6.0, 2.0, Bits_Per, Total_Bits, Code_Per, Code_Total,
         Combinations, Log10_Count, Combinations_Valid, Combinations_Exact,
         Code_Total_Valid, X_Max, Y_Max, Repeats_Out, Totals_Out, Status);
      if Status /= Ath_Choice.Ok or else abs (Bits_Per - Ideal) > 1.0e-12
        or else abs (Total_Bits - 2.0 * Ideal) > 1.0e-12
        or else Code_Per /= 3.0 or else Code_Total /= 6.0
        or else Combinations /= 36.0
      then
         Fail ("die");
      end if;
   end;

   declare
      Bits_Per, Total_Bits, Code_Per, Code_Total : Long_Float;
      Combinations, Log10_Count : Long_Float;
      Combinations_Valid, Combinations_Exact, Code_Total_Valid : Boolean;
      X_Max, Y_Max : Long_Float;
      Repeats_Out : Ath_Choice.Sample_Repeats;
      Totals_Out : Ath_Choice.Sample_Bits;
      Status : Ath_Choice.Status_Code;
   begin
      Ath_Choice.Choose
        (26.0, 3.0, Bits_Per, Total_Bits, Code_Per, Code_Total,
         Combinations, Log10_Count, Combinations_Valid, Combinations_Exact,
         Code_Total_Valid, X_Max, Y_Max, Repeats_Out, Totals_Out, Status);
      if Status /= Ath_Choice.Ok or else Combinations /= 17_576.0
        or else Code_Per /= 5.0 or else abs (Total_Bits - 3.0 * Bits_Per) > 1.0e-9
      then
         Fail ("alphabet");
      end if;
      Ath_Choice.Choose
        (2.0, 0.0, Bits_Per, Total_Bits, Code_Per, Code_Total,
         Combinations, Log10_Count, Combinations_Valid, Combinations_Exact,
         Code_Total_Valid, X_Max, Y_Max, Repeats_Out, Totals_Out, Status);
      if Status /= Ath_Choice.Ok or else Total_Bits /= 0.0 or else Bits_Per /= 1.0
        or else Combinations /= 1.0 or else not Combinations_Exact
      then
         Fail ("zero-repeats");
      end if;
      Ath_Choice.Choose
        (1.0, 5.0, Bits_Per, Total_Bits, Code_Per, Code_Total,
         Combinations, Log10_Count, Combinations_Valid, Combinations_Exact,
         Code_Total_Valid, X_Max, Y_Max, Repeats_Out, Totals_Out, Status);
      if Status /= Ath_Choice.Ok or else Bits_Per /= 0.0 or else Total_Bits /= 0.0
        or else Combinations /= 1.0 or else Code_Per /= 0.0
      then
         Fail ("one-possibility");
      end if;
      Ath_Choice.Choose
        (10.0, 400.0, Bits_Per, Total_Bits, Code_Per, Code_Total,
         Combinations, Log10_Count, Combinations_Valid, Combinations_Exact,
         Code_Total_Valid, X_Max, Y_Max, Repeats_Out, Totals_Out, Status);
      if Status /= Ath_Choice.Ok or else Combinations_Valid or else Combinations /= 0.0
        or else abs (Log10_Count - 400.0) > 1.0e-6
        or else Total_Bits <= 1_300.0 or else Total_Bits >= 1_400.0
        or else Totals_Out (Ath_Choice.Sample_Count) /= Total_Bits
      then
         Fail ("huge-count");
      end if;
   end;

   Run ("zero-n", 0.0, 1.0, Ath_Choice.Count_Not_Positive);
   Run ("negative-n", -2.0, 1.0, Ath_Choice.Count_Not_Positive);
   Run ("fraction-n", 2.5, 1.0, Ath_Choice.Not_Integer);
   Run ("fraction-k", 2.0, 1.5, Ath_Choice.Not_Integer);
   Run ("negative-k", 2.0, -1.0, Ath_Choice.Repeats_Negative);
   declare
      type Word is mod 2 ** 64;
      function To_Float is new Ada.Unchecked_Conversion (Word, Long_Float);
   begin
      Run ("nan", To_Float (16#7FF8_0000_0000_0001#), 1.0, Ath_Choice.Non_Finite_Input);
   end;
   Run ("too-wide", 2.0 ** 53 + 2.0, 1.0, Ath_Choice.Out_Of_Range);

   if Ath_Choice_Exports.Ath_Choice_F64 (2.0, 8.0) /= 0
     or else Ath_Choice_Exports.Ath_Choice_Total_Bits /= 8.0
     or else Ath_Choice_Exports.Ath_Choice_Combinations /= 256.0
     or else Ath_Choice_Exports.Ath_Choice_Sample_Count /= Ath_Choice.Sample_Count
   then
      Fail ("export-coin");
   end if;
   if Ath_Choice_Exports.Ath_Choice_F64 (0.0, 1.0) /= 3
     or else Ath_Choice_Exports.Ath_Choice_Sample_Count /= 0
     or else Ath_Choice_Exports.Ath_Choice_Total_Bits /= 0.0
   then
      Fail ("export-cleared");
   end if;

   if Failures = 0 then
      Ada.Text_IO.Put_Line ("CHOICE OK");
   else
      Ada.Text_IO.Put_Line ("CHOICE FAILURES" & Failures'Image);
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Failure);
   end if;
end Choice_Tests;

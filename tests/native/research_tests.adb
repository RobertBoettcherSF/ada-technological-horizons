with Ada.Command_Line;
with Ada.Text_IO;
with Ada.Unchecked_Conversion;
with Interfaces;
with Ath_Research;
with Ath_Research_Exports;

procedure Research_Tests is
   use type Interfaces.Integer_32;
   use type Ath_Research.Status_Code;

   Failures : Natural := 0;

   procedure Fail (Name : String) is
   begin
      Failures := Failures + 1;
      Ada.Text_IO.Put_Line ("FAIL " & Name);
   end Fail;

   procedure Check
     (Name : String;
      D0, R0, Dd, Rd, Elapsed : Long_Float;
      Expected_Status : Ath_Research.Status_Code;
      Expect_D, Expect_R, Expect_Ratio : Long_Float := 0.0;
      Check_Values : Boolean := False) is
      Discoveries, Researchers, Ratio : Long_Float;
      X_Max, Index_Max, Ratio_Max : Long_Float;
      Times, Discovery_Samples, Researcher_Samples, Ratio_Samples : Ath_Research.Sample_Values;
      Status : Ath_Research.Status_Code;
   begin
      Ath_Research.Compare
        (D0, R0, Dd, Rd, Elapsed,
         Discoveries, Researchers, Ratio, X_Max, Index_Max, Ratio_Max,
         Times, Discovery_Samples, Researcher_Samples, Ratio_Samples, Status);
      if Status /= Expected_Status then
         Fail (Name & " status");
         return;
      end if;
      if not Check_Values then
         return;
      end if;
      if abs (Discoveries - Expect_D) > 1.0e-12
        or else abs (Researchers - Expect_R) > 1.0e-12
        or else abs (Ratio - Expect_Ratio) > 1.0e-12
      then
         Ada.Text_IO.Put_Line (Name & Discoveries'Image & Researchers'Image & Ratio'Image);
         Fail (Name & " values");
      end if;
      if Times (1) /= 0.0
        or else Times (Ath_Research.Sample_Count) /= Elapsed
        or else abs (Discovery_Samples (1) - D0) > 1.0e-12
        or else abs (Researcher_Samples (1) - R0) > 1.0e-12
        or else abs (Discovery_Samples (Ath_Research.Sample_Count) - Expect_D) > 1.0e-12
        or else abs (Ratio_Samples (Ath_Research.Sample_Count) - Expect_Ratio) > 1.0e-12
      then
         Fail (Name & " samples");
      end if;
   end Check;
begin
   Check ("book", 1.0, 1.0, 30.0, 10.0, 30.0, Ath_Research.Ok, 2.0, 8.0, 0.25, True);
   Check ("same-pace", 1.0, 1.0, 30.0, 30.0, 30.0, Ath_Research.Ok, 2.0, 2.0, 1.0, True);
   Check ("start", 1.0, 1.0, 30.0, 10.0, 0.0, Ath_Research.Ok, 1.0, 1.0, 1.0, True);
   Check ("zero-index", 0.0, 1.0, 30.0, 10.0, 30.0, Ath_Research.Index_Not_Positive);
   Check ("negative-index", 1.0, -1.0, 30.0, 10.0, 30.0, Ath_Research.Index_Not_Positive);
   Check ("negative-years", 1.0, 1.0, 30.0, 10.0, -1.0, Ath_Research.Elapsed_Negative);
   Check ("zero-doubling", 1.0, 1.0, 0.0, 10.0, 30.0, Ath_Research.Doubling_Not_Positive);
   Check ("overflow", 1.0, 1.0, 1.0, 10.0, 20_000.0, Ath_Research.Result_Not_Finite);
   declare
      type Word is mod 2 ** 64;
      function To_Float is new Ada.Unchecked_Conversion (Word, Long_Float);
   begin
      Check ("nan", To_Float (16#7FF8_0000_0000_0001#), 1.0, 30.0, 10.0, 30.0, Ath_Research.Non_Finite_Input);
   end;

   if Ath_Research_Exports.Ath_Research_F64 (1.0, 1.0, 30.0, 10.0, 30.0) /= 0
     or else Ath_Research_Exports.Ath_Research_Discoveries /= 2.0
     or else Ath_Research_Exports.Ath_Research_Researchers /= 8.0
     or else Ath_Research_Exports.Ath_Research_Ratio /= 0.25
     or else Ath_Research_Exports.Ath_Research_Sample_Count /= Ath_Research.Sample_Count
     or else Ath_Research_Exports.Ath_Research_Sample_Ratio (Ath_Research.Sample_Count) /= 0.25
   then
      Fail ("export-book");
   end if;
   if Ath_Research_Exports.Ath_Research_F64 (0.0, 1.0, 30.0, 10.0, 30.0) /= 2
     or else Ath_Research_Exports.Ath_Research_Sample_Count /= 0
     or else Ath_Research_Exports.Ath_Research_Ratio /= 0.0
   then
      Fail ("export-cleared");
   end if;

   if Failures = 0 then
      Ada.Text_IO.Put_Line ("RESEARCH OK");
   else
      Ada.Text_IO.Put_Line ("RESEARCH FAILURES" & Failures'Image);
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Failure);
   end if;
end Research_Tests;
